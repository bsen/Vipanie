-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "aadhaarToken" TEXT,
    "profilePicture" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "accountStatus" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourPost" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "specialRequest" TEXT,
    "image" TEXT,
    "budget" DOUBLE PRECISION NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bidding" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "favourPostId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bidding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourMatch" (
    "id" TEXT NOT NULL,
    "favourCreatorId" TEXT NOT NULL,
    "favourRecipientId" TEXT NOT NULL,
    "favourAmount" DOUBLE PRECISION NOT NULL,
    "completionStatus" BOOLEAN NOT NULL DEFAULT false,
    "closingOtp" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "User_aadhaarToken_key" ON "User"("aadhaarToken");

-- CreateIndex
CREATE UNIQUE INDEX "favourMatch_favourCreatorId_favourRecipientId_key" ON "favourMatch"("favourCreatorId", "favourRecipientId");

-- AddForeignKey
ALTER TABLE "favourPost" ADD CONSTRAINT "favourPost_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bidding" ADD CONSTRAINT "Bidding_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bidding" ADD CONSTRAINT "Bidding_favourPostId_fkey" FOREIGN KEY ("favourPostId") REFERENCES "favourPost"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourMatch" ADD CONSTRAINT "favourMatch_favourCreatorId_fkey" FOREIGN KEY ("favourCreatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourMatch" ADD CONSTRAINT "favourMatch_favourRecipientId_fkey" FOREIGN KEY ("favourRecipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
