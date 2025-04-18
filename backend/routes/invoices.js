const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

const validateInvoice = (req, res, next) => {
  const { promotionID, customerID, exportTime, paymentMethod, tax } = req.body;
  
  if (!customerID || !Number.isInteger(parseInt(customerID))) {
    return res.status(400).json({ error: 'Valid Customer ID is required' });
  }
  
  if (!promotionID || !Number.isInteger(parseInt(promotionID))) {
    return res.status(400).json({ error: 'Valid Promotion ID is required' });
  }

  if (!paymentMethod) {
    return res.status(400).json({ error: 'Payment method is required' });
  }
  
  if (tax !== undefined && (tax < 0 || tax > 100)) {
    return res.status(400).json({ error: 'Tax must be between 0 and 100' });
  }

  next();
};

router.post('/', validateInvoice, async (req, res) => {
  const { promotionID, customerID, exportTime, paymentMethod, tax, details } = req.body;
  try {
    const invoice = await prisma.invoices.create({
      data: {
        Promotions: {
          connect: { ID: promotionID }
        },
        Customers: {
          connect: { ID: customerID }
        },
        exportTime: exportTime || new Date(),
        paymentMethod,
        tax,
        updatedBy: req.user.id,
      },
      include: {
        Customers: true,
        Promotions: true,
        InvoiceDetails: {
          include: {
            Products: true
          }
        }
      }
    });
    
    if (details && Array.isArray(details)) {
      await prisma.invoiceDetails.createMany({
        data: details.map(detail => ({
          ...detail,
          invoiceID: invoice.ID
        }))
      });
    }

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customerID,
      startDate,
      endDate,
      paymentMethod
    } = req.query;

    const skip = (page - 1) * parseInt(limit);
    
    const where = {};
    if (customerID) where.Customers = { ID: parseInt(customerID) };
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (startDate || endDate) {
      where.exportTime = {};
      if (startDate) where.exportTime.gte = new Date(startDate);
      if (endDate) where.exportTime.lte = new Date(endDate);
    }

    const total = await prisma.invoices.count({ where });

    const invoices = await prisma.invoices.findMany({
      skip,
      take: parseInt(limit),
      where,
      include: {
        Customers: true,
        Promotions: true,
        InvoiceDetails: {
          include: {
            Products: true
          }
        }
      },
      orderBy: {
        ID: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      data: invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const invoice = await prisma.invoices.findUnique({
      where: { ID: parseInt(id) },
      include: {
        Customers: true,
        Promotions: true,
        InvoiceDetails: {
          include: {
            Products: true
          }
        }
      }
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.put('/:id', validateInvoice, async (req, res) => {
  const { id } = req.params;
  const { promotionID, customerID, exportTime, paymentMethod, tax, details } = req.body;
  
  try {
    const result = await prisma.$transaction(async (prisma) => {
      const invoice = await prisma.invoices.update({
        where: { ID: parseInt(id) },
        data: {
          Promotions: {
            connect: { ID: promotionID }
          },
          Customers: {
            connect: { ID: customerID }
          },
          exportTime,
          paymentMethod,
          tax,
          updatedBy: req.user.id
        },
      include: {
        Customers: true,
        Promotions: true,
        InvoiceDetails: {
          include: {
            Products: true
          }
        }
      }
      });

      if (details && Array.isArray(details)) {
        await prisma.invoiceDetails.deleteMany({
          where: { invoiceID: parseInt(id) }
        });

        await prisma.invoiceDetails.createMany({
          data: details.map(detail => ({
            ...detail,
            invoiceID: parseInt(id)
          }))
        });
      }

      return invoice;
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.$transaction(async (prisma) => {
      // Delete related shipments first
      await prisma.shipments.deleteMany({
        where: { invoiceID: parseInt(id) }
      });

      // Then delete invoice details
      await prisma.invoiceDetails.deleteMany({
        where: { invoiceID: parseInt(id) }
      });

      // Finally delete the invoice
      await prisma.invoices.delete({
        where: { ID: parseInt(id) }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
