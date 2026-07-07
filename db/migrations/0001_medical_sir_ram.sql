CREATE TYPE "public"."payment_terms" AS ENUM('upfront', 'split_30');--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "duration_days" integer;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "payment_terms" "payment_terms";