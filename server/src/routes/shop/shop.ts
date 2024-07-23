import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import jwt from "jsonwebtoken";
import { z } from "zod";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import shopMiddleware from "../middleware/authMiddleware";
const shopRouter = express.Router();
const emailSchema = z.string().email();

const s3 = new S3Client({
  region: process.env.BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY as string,
    secretAccessKey: process.env.SECRET_ACCESS_KEY as string,
  },
});

const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only images are allowed."));
    }
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

shopRouter.post("/auth", async (req, res) => {
  try {
    const { email, photoURL } = req.body;
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) {
      return res.json({ status: 400, message: "Invalid email" });
    }
    let shop = await prisma.shop.findFirst({
      where: { email: email },
    });

    if (!shop) {
      const baseShopName = email.split("@")[0].toLowerCase();
      let shopName = baseShopName;
      const generateRandomString = (length = 6) => {
        const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
        return Array.from(
          { length },
          () => characters[Math.floor(Math.random() * characters.length)]
        ).join("");
      };

      let attempts = 0;
      while (await prisma.shop.findFirst({ where: { shopName: shopName } })) {
        shopName = `${baseShopName}_${generateRandomString()}`;
        attempts++;
        if (attempts > 10) {
          return res.status(500).json({
            message: "Unable to generate unique ShopName",
          });
        }
      }

      shop = await prisma.shop.create({
        data: {
          shopName: shopName,
          email: email,
          image: photoURL,
        },
      });
      if (!shop) {
        return res.status(500).json({ message: "Account creation failed" });
      }
    }

    const token = jwt.sign({ id: shop.id }, process.env.JWT_SECRET as string);
    return res.json({
      status: 200,
      token: token,
      message: "Authentication successful",
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error message:", error);
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

shopRouter.post("/data", shopMiddleware, async (req, res) => {
  try {
    const shop = (req as any).shop;
    const shopId = shop?.id;
    const findShopDetails = await prisma.shop.findFirst({
      where: {
        id: shopId,
      },
      select: {
        shopName: true,
        image: true,
      },
    });
    if (!findShopDetails) {
      return res.json({ status: 404, message: "Shop not found" });
    }

    return res.json({
      status: 200,
      data: findShopDetails,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error message:", error);
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

shopRouter.post("/update-name", shopMiddleware, async (req, res) => {
  try {
    const { newShopName } = req.body;
    const shop = (req as any).shop;
    const shopId = shop.id;

    const shopNameAvailCheck = await prisma.shop.findFirst({
      where: {
        shopName: newShopName.toLowerCase(),
      },
    });
    if (shopNameAvailCheck) {
      return res.json({
        status: 404,
        message: "A shop with the same name already exists",
      });
    }
    const updateDetails = await prisma.shop.update({
      where: {
        id: shopId,
      },
      data: { shopName: newShopName },
    });
    if (!updateDetails) {
      return res.json({ status: 400, message: "Updation failed" });
    }
    return res.json({ status: 200, message: "Updation successful" });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error message:", error);
    }

    return res.status(500).json({ message: "Internal server error" });
  }
});

shopRouter.post("/add-product", upload, shopMiddleware, async (req, res) => {
  try {
    const shop = (req as any).shop;
    const shopId = shop.id;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files.image?.[0] || files.file?.[0] || null;
    const { title, description, price } = req.body;
    const findShop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!findShop) {
      return res.json({ status: 401, message: "Unverified" });
    }

    let fileUrl = null;
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        return res.json({
          status: 400,
          message: "Try to upload a file sized less than 15 MB.",
        });
      }

      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${findShop.shopName}/${title}-${Date.now()}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        fileUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/${params.Key}`;
      } catch (error) {
        return res.json({ status: 500, message: "Failed to upload file." });
      }
    }

    const addProduct = await prisma.product.create({
      data: {
        shopId: shopId,
        title: title,
        description: description,
        price: parseFloat(price),
        image: fileUrl,
      },
    });

    if (!addProduct) {
      return res.json({ status: 403, message: "Failed to add the product." });
    }

    return res.json({ status: 200, message: "Product added successfully." });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "Try again later, Network error",
    });
  }
});

shopRouter.post("/products", shopMiddleware, async (req, res) => {
  try {
    const shop = (req as any).shop;
    const shopId = shop.id;
    const produts = await prisma.product.findMany({
      where: {
        shopId: shopId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        price: true,
        available: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!produts) {
      return res.json({ status: 404, message: "No products found" });
    }
    return res.json({ status: 200, data: produts });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "Try again later, Network error",
    });
  }
});

shopRouter.post("/product-listunlist", shopMiddleware, async (req, res) => {
  try {
    const shop = (req as any).shop;
    const shopId = shop.id;
    const { productId } = req.body;
    const findProduct = await prisma.product.findFirst({
      where: { id: productId },
    });
    if (findProduct?.available) {
      const updateProductStatus = await prisma.product.update({
        where: {
          id: productId,
          shopId: shopId,
        },
        data: {
          available: false,
        },
      });
      if (!updateProductStatus) {
        return res.json({ status: 400, message: "Updation failed" });
      }
    } else {
      const updateProductStatus = await prisma.product.update({
        where: {
          id: productId,
          shopId: shopId,
        },
        data: {
          available: true,
        },
      });
      if (!updateProductStatus) {
        return res.json({ status: 400, message: "Updation failed" });
      }
    }

    return res.json({ status: 200, message: "Deletion successful" });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "Try again later, Network error",
    });
  }
});

shopRouter.post("/shop-data", async (req, res) => {
  try {
    const { store } = req.body;
    const shopData = await prisma.shop.findUnique({
      where: { shopName: store },
      select: {
        id: true,
        shopName: true,
        image: true,
      },
    });

    if (!shopData) {
      return res.json({ status: 404, message: "Shop not found" });
    }

    return res.json({ status: 200, data: shopData });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "An error occurred while fetching shop details",
    });
  }
});

shopRouter.post("/shop-products", async (req, res) => {
  try {
    const { store } = req.body;
    const findShop = await prisma.shop.findFirst({
      where: { shopName: store },
    });
    const products = await prisma.product.findMany({
      where: {
        shopId: findShop?.id,
        available: true,
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        price: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ status: 200, data: products });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "An error occurred while fetching products",
    });
  }
});
shopRouter.post("/create-order", async (req, res) => {
  try {
    const { fullname, phone, address, pincode, state, productId } = req.body;
    console.log({ fullname, phone, address, pincode, state, productId });
    if (!fullname || !phone || !address || !pincode || !state || !productId) {
      return res.json({ status: 400, message: "All fields are required" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { price: true, shopId: true, available: true },
    });

    if (!product) {
      return res.json({ status: 404, message: "Product not found" });
    }

    if (!product.available) {
      return res.json({ status: 400, message: "Product is not available" });
    }

    const newOrder = await prisma.order.create({
      data: {
        fullname,
        phone,
        address,
        pincode,
        state,
        amount: product.price,
        productId,
        shopId: product.shopId,
      },
    });

    return res.json({
      status: 200,
      message: "Order created successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "An error occurred while creating the order",
    });
  }
});

shopRouter.post("/orders", shopMiddleware, async (req, res) => {
  try {
    const shop = (req as any).shop;
    const shopId = shop.id;

    const orders = await prisma.order.findMany({
      where: {
        shopId: shopId,
      },
      select: {
        id: true,
        fullname: true,
        phone: true,
        address: true,
        pincode: true,
        state: true,
        amount: true,
        createdAt: true,
        product: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({ status: 200, data: orders });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({
      status: 500,
      message: "An error occurred while fetching orders",
    });
  }
});

shopRouter.post("/update-image", upload, shopMiddleware, async (req, res) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const file = files.image?.[0] || files.file?.[0] || null;

    const shop = (req as any).shop;
    const shopId = shop.id;
    const findShop = await prisma.shop.findUnique({ where: { id: shopId } });

    if (!findShop) {
      return res.json({ status: 401, message: "Unverified" });
    }

    let imageUrl = findShop.image;

    if (file) {
      if (findShop.image) {
        const fileUrl = findShop.image;
        if (fileUrl) {
          const key = fileUrl.replace(
            `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/`,
            ""
          );

          const deleteParams = {
            Bucket: process.env.BUCKET_NAME as string,
            Key: key,
          };

          try {
            const command = new DeleteObjectCommand(deleteParams);
            await s3.send(command);
          } catch (error) {
            console.error("Error deleting file from S3:", error);
          }
        }
      }
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${findShop.shopName}/profile-${Date.now()}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
      } catch (error) {
        return res.json({ status: 500, message: "Failed to upload image" });
      }
      imageUrl = `https://${process.env.CLOUDFRONT_DISTRIBUTION_DOMAIN}/${params.Key}`;
    }

    const success = await prisma.shop.update({
      where: { id: shopId },
      data: {
        image: imageUrl,
      },
    });

    if (!success) {
      return res.json({ status: 403, message: "Failed to update profile" });
    }

    return res.json({ status: 200, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error message:", error);
    return res.json({ status: 500, message: "Profile update failed" });
  }
});
export default shopRouter;
