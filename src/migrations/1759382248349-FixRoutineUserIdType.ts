import { MigrationInterface, QueryRunner } from "typeorm";

export class FixRoutineUserIdType1759382248349 implements MigrationInterface {
    name = 'FixRoutineUserIdType1759382248349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "routines" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7" UNIQUE ("routine_id", "user_id", "date")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7"`);
        await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "routines" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7" UNIQUE ("routine_id", "user_id", "date")`);
    }

}
