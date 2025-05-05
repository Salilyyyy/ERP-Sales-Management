const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

const validateInvoice = (req, res, next) => {
  const { promotionID, customerID, exportTime, paymentMethod, tax } = req.body;
  
  if (!customerID || !Number.isInteger(parseInt(customerID))) {
    return res.status(400).json({ error: 'Valid Customer ID is required' });
  }
  
  if (promotionID !== null && (!Number.isInteger(parseInt(promotionID)))) {
    return res.status(400).json({ error: 'If provided, Promotion ID must be valid' });
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
    const result = await prisma.$transaction(async (tx) => {
      if (details && Array.isArray(details)) {
        for (const detail of details) {
          const product = await tx.product.findUnique({
            where: { ID: detail.productID }
          });
          
          if (!product) {
            throw new Error(`Product with ID ${detail.productID} not found`);
          }
          
          if (product.quantity < detail.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${detail.quantity}`);
          }
        }
      }

      const {
        recipientName,
        recipientPhone,
        recipientAddress,
        district,
        province,
        ward,
        isPaid,
        isDelivery
      } = req.body;

      // Create invoice with basic data
      const invoiceData = {
        Customers: {
          connect: { ID: customerID }
        },
        exportTime: exportTime || new Date(),
        paymentMethod,
        tax,
        isPaid: isPaid || false,
        isDelivery: isDelivery || false,
        ...(promotionID && {
          Promotions: {
            connect: { ID: parseInt(promotionID) }
          }
        })
      };

      // Create invoice and get result
      const cleanInvoice = await tx.invoices.create({
        data: invoiceData
      });

      // Fetch complete invoice with all relations
      const invoice = await tx.invoices.findUnique({
        where: { ID: cleanInvoice.ID },
        include: {
          Customers: true,
          Promotions: true,
          InvoiceDetails: {
            include: {
              Products: {
                select: {
                  ID: true,
                  name: true,
                  unit: true,
                  quantity: true,
                  outPrice: true
                }
              }
            }
          },
          Shipments: true
        }
      });

      // Create shipment if delivery is required
      if (isDelivery) {
        await tx.shipments.create({
          data: {
            invoiceID: invoice.ID,
            sendTime: new Date(),
            receiveTime: new Date(),
            recipientName,
            recipientPhone,
            recipientAddress,
            district: district || '',
            province: province || '',
            ward: ward || ''
          }
        });
      }

      // Create invoice details if provided
      if (details && Array.isArray(details)) {
        await tx.invoiceDetails.createMany({
          data: details.map(detail => ({
            productID: detail.productID,
            quantity: detail.quantity,
            unitPrice: detail.price,
            invoiceID: invoice.ID
          }))
        });

        for (const detail of details) {
          await tx.product.update({
            where: { ID: detail.productID },
            data: {
              quantity: {
                decrement: detail.quantity
              }
            }
          });
        }
      }

      return invoice;
    });

    res.status(201).json({
       redirect: '/invoices',
      success: true,
      message: 'Invoice created successfully',
      data: result,
     
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
            Products: {
              select: {
                ID: true,
                name: true,
                unit: true,
                quantity: true,
                outPrice: true
              }
            }
          }
        },
        Shipments: true
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
            Products: {
              select: {
                ID: true,
                name: true,
                unit: true,
                quantity: true,
                outPrice: true
              }
            }
          }
        },
        Shipments: true
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
    const result = await prisma.$transaction(async (tx) => {
      const currentInvoice = await tx.invoices.findUnique({
        where: { ID: parseInt(id) },
        include: {
          InvoiceDetails: true
        }
      });

      if (!currentInvoice) {
        throw new Error('Invoice not found');
      }

      // Restore previous quantities
      for (const detail of currentInvoice.InvoiceDetails) {
        await tx.product.update({
          where: { ID: detail.productID },
          data: {
            quantity: {
              increment: detail.quantity // Add back the quantities that were previously reduced
            }
          }
        });
      }

      // Check if new quantities are available
      if (details && Array.isArray(details)) {
        for (const detail of details) {
          const product = await tx.product.findUnique({
            where: { ID: detail.productID }
          });
          
          if (!product) {
            throw new Error(`Product with ID ${detail.productID} not found`);
          }
          
          if (product.quantity < detail.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.quantity}, Requested: ${detail.quantity}`);
          }
        }
      }

      // Update invoice
      const {
        recipientName,
        recipientPhone,
        recipientAddress,
        district,
        province,
        ward,
        isPaid,
        isDelivery
      } = req.body;

      // Update invoice with basic data first
      const cleanInvoice = await tx.invoices.update({
        where: { ID: parseInt(id) },
        data: {
          Customers: {
            connect: { ID: customerID }
          },
          Promotions: promotionID ? {
            connect: { ID: promotionID }
          } : {
            disconnect: true
          },
          exportTime,
          paymentMethod,
          tax,
          isPaid: isPaid || false,
          isDelivery: isDelivery || false,
          Shipments: isDelivery ? {
            upsert: {
              where: { invoiceID: parseInt(id) },
              create: {
                sendTime: new Date(),
                receiveTime: new Date(),
                recipientName,
                recipientPhone,
                recipientAddress,
                district: district || '',
                province: province || '',
                ward: ward || ''
              },
              update: {
                recipientName,
                recipientPhone,
                recipientAddress,
                district: district || '',
                province: province || '',
                ward: ward || ''
              }
            }
          } : {
            deleteMany: {
              invoiceID: parseInt(id)
            }
          }
        },
      });

      // Fetch complete updated invoice with all relations
      const invoice = await tx.invoices.findUnique({
        where: { ID: cleanInvoice.ID },
        include: {
          Customers: true,
          Promotions: true,
          InvoiceDetails: {
            include: {
              Products: {
                select: {
                  ID: true,
                  name: true,
                  unit: true,
                  quantity: true,
                  outPrice: true
                }
              }
            }
          },
          Shipments: true
        }
      });

      if (details && Array.isArray(details)) {
        // Delete old invoice details
        await tx.invoiceDetails.deleteMany({
          where: { invoiceID: parseInt(id) }
        });

        // Create new invoice details
        await tx.invoiceDetails.createMany({
          data: details.map(detail => ({
            productID: detail.productID,
            quantity: detail.quantity,
            unitPrice: detail.price,
            invoiceID: parseInt(id)
          }))
        });

        // Update product quantities with new values
        for (const detail of details) {
          await tx.product.update({
            where: { ID: detail.productID },
            data: {
              quantity: {
                decrement: detail.quantity
              }
            }
          });
        }
      }

      return invoice;
    });

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: result,
      redirect: '/invoices'
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
    await prisma.$transaction(async (tx) => {
      // Get invoice details to restore quantities
      const invoice = await tx.invoices.findUnique({
        where: { ID: parseInt(id) },
        include: {
          InvoiceDetails: true
        }
      });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Restore product quantities
      for (const detail of invoice.InvoiceDetails) {
        await tx.product.update({
          where: { ID: detail.productID },
          data: {
            quantity: {
              increment: detail.quantity // Return the quantities back to inventory
            }
          }
        });
      }

      // Delete related shipments first
      await tx.shipments.deleteMany({
        where: { invoiceID: parseInt(id) }
      });

      // Then delete invoice details
      await tx.invoiceDetails.deleteMany({
        where: { invoiceID: parseInt(id) }
      });

      // Finally delete the invoice
      await tx.invoices.delete({
        where: { ID: parseInt(id) }
      });
    });

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully',
      redirect: '/invoices'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
