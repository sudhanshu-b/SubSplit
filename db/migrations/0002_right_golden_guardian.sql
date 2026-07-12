CREATE TYPE "public"."feedback_status" AS ENUM('open', 'in_review', 'done', 'closed');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('bug', 'feature_request', 'other');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" "feedback_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"status" "feedback_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "membership_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"membership_id" uuid NOT NULL,
	"installment_number" integer DEFAULT 1 NOT NULL,
	"amount" numeric(10, 2),
	"paid_at" timestamp with time zone,
	"transaction_ref" text,
	"proof_image_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mp_unique" UNIQUE("membership_id","installment_number")
);
--> statement-breakpoint
CREATE TABLE "report" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reported_user_id" text NOT NULL,
	"reporter_id" text,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_name" text NOT NULL,
	"author_role" text NOT NULL,
	"body" text NOT NULL,
	"metric" text NOT NULL,
	"metric_label" text NOT NULL,
	"avatar_url" text,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'recruiting'::text;--> statement-breakpoint
DROP TYPE "public"."subscription_status";--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('recruiting', 'ready_to_purchase', 'active', 'completed', 'cancelled');--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'recruiting'::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DATA TYPE "public"."subscription_status" USING "status"::"public"."subscription_status";--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "role" "user_role" DEFAULT 'USER' NOT NULL;--> statement-breakpoint
ALTER TABLE "app_user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD COLUMN "last_read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "membership" ADD COLUMN "last_reminded_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "upi_id" text;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_payment" ADD CONSTRAINT "membership_payment_membership_id_membership_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."membership"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reported_user_id_app_user_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report" ADD CONSTRAINT "report_reporter_id_app_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_feedback_user" ON "feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_feedback_status" ON "feedback" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_mp_membership" ON "membership_payment" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "idx_report_reported_user" ON "report" USING btree ("reported_user_id");