import { MigrationInterface, QueryRunner } from "typeorm";

export class RevertCategoryToVarchar1759570699845 implements MigrationInterface {
    name = 'RevertCategoryToVarchar1759570699845'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "routines" ADD "category" character varying(50)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "routines" ADD "category" text`);
    }

}
