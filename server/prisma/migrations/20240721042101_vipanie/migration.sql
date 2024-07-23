/*
  Warnings:

  - You are about to drop the column `aadhaarToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `balance` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `birthDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mobileNumber` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profilePicture` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Bidding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favourMatch` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favourPost` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shopName]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shopName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bidding" DROP CONSTRAINT "Bidding_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "Bidding" DROP CONSTRAINT "Bidding_favourPostId_fkey";

-- DropForeignKey
ALTER TABLE "favourMatch" DROP CONSTRAINT "favourMatch_favourCreatorId_fkey";

-- DropForeignKey
ALTER TABLE "favourMatch" DROP CONSTRAINT "favourMatch_favourRecipientId_fkey";

-- DropForeignKey
ALTER TABLE "favourPost" DROP CONSTRAINT "favourPost_creatorId_fkey";

-- DropIndex
DROP INDEX "User_aadhaarToken_key";

-- DropIndex
DROP INDEX "User_mobileNumber_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "aadhaarToken",
DROP COLUMN "balance",
DROP COLUMN "birthDate",
DROP COLUMN "firstName",
DROP COLUMN "gender",
DROP COLUMN "lastName",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "mobileNumber",
DROP COLUMN "profilePicture",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "shopName" TEXT NOT NULL;

-- DropTable
DROP TABLE "Bidding";

-- DropTable
DROP TABLE "favourMatch";

-- DropTable
DROP TABLE "favourPost";

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "fullname" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_shopName_key" ON "User"("shopName");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
