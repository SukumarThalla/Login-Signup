ALTER TABLE "password_reject_token" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reject_token" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "password_reject_token" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "password_reject_token" ADD CONSTRAINT "password_reject_token_user_id_users_Data_Id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users_Data"("Id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reset_password_id_index" ON "password_reject_token" USING btree ("user_id");--> statement-breakpoint
ALTER TABLE "password_reject_token" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "password_reject_token" DROP COLUMN "expires_at";