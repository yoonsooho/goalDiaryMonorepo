import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRoutineTables1759382119155 implements MigrationInterface {
  name = 'CreateRoutineTables1759382119155';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "routine_completions" ("id" SERIAL NOT NULL, "routine_id" integer NOT NULL, "user_id" integer NOT NULL, "completed_at" TIMESTAMP NOT NULL DEFAULT now(), "date" date NOT NULL, "routineId" integer NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7" UNIQUE ("routine_id", "user_id", "date"), CONSTRAINT "PK_c19695923398af235033ce301e8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."routines_frequency_enum" AS ENUM('daily', 'weekly', 'monthly')`,
    );
    await queryRunner.query(
      `CREATE TABLE "routines" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "title" character varying(255) NOT NULL, "description" text, "frequency" "public"."routines_frequency_enum" NOT NULL DEFAULT 'daily', "time" TIME, "duration" integer, "isActive" boolean NOT NULL DEFAULT true, "category" character varying(50), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_6847e8f0f74e65a6f10409dee9f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_completions" ADD CONSTRAINT "FK_8549fb1e76de0af9abf041b6385" FOREIGN KEY ("routineId") REFERENCES "routines"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_completions" ADD CONSTRAINT "FK_c75ff1a0f2782ede805376ca584" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "routines" ADD CONSTRAINT "FK_6ae06dff0a9aad63673a8b48d0a" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "routines" DROP CONSTRAINT "FK_6ae06dff0a9aad63673a8b48d0a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_completions" DROP CONSTRAINT "FK_c75ff1a0f2782ede805376ca584"`,
    );
    await queryRunner.query(
      `ALTER TABLE "routine_completions" DROP CONSTRAINT "FK_8549fb1e76de0af9abf041b6385"`,
    );
    await queryRunner.query(`DROP TABLE "routines"`);
    await queryRunner.query(`DROP TYPE "public"."routines_frequency_enum"`);
    await queryRunner.query(`DROP TABLE "routine_completions"`);
  }
}
