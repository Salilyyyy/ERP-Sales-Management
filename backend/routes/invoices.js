const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/', async (req, res) => {
const { promotionID, customerID, employeeName, exportTime, paymentMethod, tax, details } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const creator = await tx.users.findFirst({
        where: { name: employeeName }
      });

      if (!creator) {
        throw new Error(`Creator with name ${employeeName} not found`);
      }

      if (details && Array.isArray(details)) {
        const productIds = details.map(detail => detail.productID);
        const products = await tx.product.findMany({
          where: { ID: { in: productIds } }
        });

        const productMap = new Map(products.map(p => [p.ID, p]));

        for (const detail of details) {
          const product = productMap.get(detail.productID);
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

      const invoiceData = {
        Customers: {
        connect: { ID: customerID }
      },
      Creator: {
        connect: { ID: creator.ID }
      },
      exportTime: exportTime || new Date(),
        paymentMethod,
        tax,
        total: req.body.total || 0,
        isPaid: isPaid || false,
        isDelivery: isDelivery || false,
        ...(promotionID && {
          Promotions: {
            connect: { ID: parseInt(promotionID) }
          }
        })
      };

      const cleanInvoice = await tx.invoices.create({
        data: invoiceData
      });

      if (isDelivery) {
        await tx.shipments.create({
          data: {
            invoiceID: cleanInvoice.ID,
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

      if (details && Array.isArray(details)) {
        await tx.invoiceDetails.createMany({
          data: details.map(detail => ({
            productID: detail.productID,
            quantity: detail.quantity,
            unitPrice: detail.price,
            invoiceID: cleanInvoice.ID
          }))
        });

        await Promise.all(details.map(detail => 
          tx.product.update({
            where: { ID: detail.productID },
            data: { quantity: { decrement: detail.quantity } }
          })
        ));
      }

      return cleanInvoice;
    }, {
      timeout: 30000 
    });

    const invoice = await prisma.invoices.findUnique({
      where: { ID: result.ID },
        include: {
          Customers: true,
          Creator: true,
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

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoice,
      redirect: '/invoices'
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
    
    if (req.query.unshippedOnly === 'true') {
      where.AND = [
        { isDelivery: true },
        {
          Shipments: {
            some: {
              postOfficeID: null
            }
          }
        }
      ];
    }

    const [total, invoices] = await Promise.all([
      prisma.invoices.count({ where }),
      prisma.invoices.findMany({
        skip,
        take: parseInt(limit),
        where,
        include: {
          Customers: true,
          Creator: true,
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
        orderBy: { ID: 'desc' }
      })
    ]);

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
        Creator: true,
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

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const currentInvoice = await tx.invoices.findUnique({
        where: { ID: parseInt(id) },
        select: {
          ID: true,
          InvoiceDetails: {
            select: {
              productID: true,
              quantity: true
            }
          }
        }
      });

      if (!currentInvoice) {
        throw new Error('Invoice not found');
      }

      const { details, ...updateFields } = req.body;

      const updateData = {};
      
      if (updateFields.customerID !== undefined) {
        updateData.Customers = { connect: { ID: updateFields.customerID } };
      }
      if (updateFields.creatorID !== undefined) {
        updateData.Creator = { connect: { ID: updateFields.creatorID } };
      }
      if (updateFields.promotionID !== undefined) {
        updateData.Promotions = updateFields.promotionID ? 
          { connect: { ID: updateFields.promotionID } } : 
          { disconnect: true };
      }
      if (updateFields.exportTime !== undefined) updateData.exportTime = updateFields.exportTime;
      if (updateFields.paymentMethod !== undefined) updateData.paymentMethod = updateFields.paymentMethod;
      if (updateFields.tax !== undefined) updateData.tax = updateFields.tax;
      if (updateFields.total !== undefined) updateData.total = updateFields.total;
      if (updateFields.isPaid !== undefined) updateData.isPaid = updateFields.isPaid;
      if (updateFields.isDelivery !== undefined) updateData.isDelivery = updateFields.isDelivery;

      if (updateFields.isDelivery !== undefined || 
          updateFields.recipientName !== undefined || 
          updateFields.recipientPhone !== undefined || 
          updateFields.recipientAddress !== undefined || 
          updateFields.district !== undefined || 
          updateFields.province !== undefined || 
          updateFields.ward !== undefined) {
        
        updateData.Shipments = updateFields.isDelivery ? {
          upsert: {
            where: { invoiceID: parseInt(id) },
            create: {
              sendTime: new Date(),
              receiveTime: new Date(),
              recipientName: updateFields.recipientName,
              recipientPhone: updateFields.recipientPhone,
              recipientAddress: updateFields.recipientAddress,
              district: updateFields.district || '',
              province: updateFields.province || '',
              ward: updateFields.ward || ''
            },
            update: {
              ...(updateFields.recipientName !== undefined && { recipientName: updateFields.recipientName }),
              ...(updateFields.recipientPhone !== undefined && { recipientPhone: updateFields.recipientPhone }),
              ...(updateFields.recipientAddress !== undefined && { recipientAddress: updateFields.recipientAddress }),
              ...(updateFields.district !== undefined && { district: updateFields.district }),
              ...(updateFields.province !== undefined && { province: updateFields.province }),
              ...(updateFields.ward !== undefined && { ward: updateFields.ward })
            }
          }
        } : {
          deleteMany: { invoiceID: parseInt(id) }
        };
      }

      if (details && Array.isArray(details)) {
        const productIds = details.map(d => d.productID);
        const products = await tx.product.findMany({
          where: { ID: { in: productIds } },
          select: { ID: true, quantity: true, name: true }
        });
        const productMap = new Map(products.map(p => [p.ID, p]));

        for (const detail of details) {
          const product = productMap.get(detail.productID);
          if (!product) {
            throw new Error(`Product with ID ${detail.productID} not found`);
          }

          const currentDetail = currentInvoice.InvoiceDetails.find(d => d.productID === detail.productID);
          const availableQuantity = product.quantity + (currentDetail?.quantity || 0);

          if (availableQuantity < detail.quantity) {
            throw new Error(`Insufficient stock for product ${product.name}. Available: ${availableQuantity}, Requested: ${detail.quantity}`);
          }
        }

        await tx.invoiceDetails.deleteMany({
          where: { invoiceID: parseInt(id) }
        });

        if (details.length > 0) {
          await tx.invoiceDetails.createMany({
            data: details.map(detail => ({
              productID: detail.productID,
              quantity: detail.quantity,
              unitPrice: detail.price,
              invoiceID: parseInt(id)
            }))
          });
        }

        await Promise.all([
          ...currentInvoice.InvoiceDetails.map(detail =>
            tx.product.update({
              where: { ID: detail.productID },
              data: { quantity: { increment: detail.quantity } }
            })
          ),
          ...details.map(detail =>
            tx.product.update({
              where: { ID: detail.productID },
              data: { quantity: { decrement: detail.quantity } }
            })
          )
        ]);
      }

      const cleanInvoice = await tx.invoices.update({
        where: { ID: parseInt(id) },
        data: updateData
      });

      return cleanInvoice;
    }, {
      timeout: 30000
    });

    const invoice = await prisma.invoices.findUnique({
      where: { ID: result.ID },
      include: {
        Customers: true,
        Creator: true,
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

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: invoice,
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
      const invoice = await tx.invoices.findUnique({
        where: { ID: parseInt(id) },
        select: {
          ID: true,
          InvoiceDetails: {
            select: {
              productID: true,
              quantity: true
            }
          }
        }
    }, {
      timeout: 30000
    });

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.InvoiceDetails.length > 0) {
        await Promise.all(invoice.InvoiceDetails.map(detail =>
          tx.product.update({
            where: { ID: detail.productID },
            data: { quantity: { increment: detail.quantity } }
          })
        ));
      }

      await Promise.all([
        tx.shipments.deleteMany({ where: { invoiceID: parseInt(id) } }),
        tx.invoiceDetails.deleteMany({ where: { invoiceID: parseInt(id) } })
      ]);

      await tx.invoices.delete({ where: { ID: parseInt(id) } });
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
