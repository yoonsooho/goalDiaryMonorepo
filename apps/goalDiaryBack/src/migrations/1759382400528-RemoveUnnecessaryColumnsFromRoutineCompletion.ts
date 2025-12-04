import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUnnecessaryColumnsFromRoutineCompletion1759382400528 implements MigrationInterface {
    name = 'RemoveUnnecessaryColumnsFromRoutineCompletion1759382400528'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT "FK_c75ff1a0f2782ede805376ca584"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN "routine_id"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD CONSTRAINT "UQ_376459a1d6a47bf6f27953b05f0" UNIQUE ("routineId", "date")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routine_completions" DROP CONSTRAINT "UQ_376459a1d6a47bf6f27953b05f0"`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD "routine_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD CONSTRAINT "UQ_61bcf2adb321a4e714641205ee7" UNIQUE ("routine_id", "date", "user_id")`);
        await queryRunner.query(`ALTER TABLE "routine_completions" ADD CONSTRAINT "FK_c75ff1a0f2782ede805376ca584" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
