-- CreateEnum
CREATE TYPE "public"."JobType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');

-- CreateTable
CREATE TABLE "public"."Job" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "jobType" "public"."JobType" NOT NULL,
    "salaryRange" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "description" TEXT NOT NULL,
    "recruiterId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Job" ADD CONSTRAINT "Job_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
