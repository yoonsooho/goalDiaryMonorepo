import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeCategoryToArray1759569736881 implements MigrationInterface {
    name = 'ChangeCategoryToArray1759569736881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "routines" ADD "category" text`);
        await queryRunner.query(`ALTER TABLE "routines" ALTER COLUMN "streak" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routines" ALTER COLUMN "streak" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routines" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "routines" ADD "category" character varying(50)`);
    }

}
