import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1763642154821 implements MigrationInterface {
    name = 'Migrations1763642154821'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "startTime"`);
        await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "endTime"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "posts" ADD "endTime" TIME`);
        await queryRunner.query(`ALTER TABLE "posts" ADD "startTime" TIME`);
    }

}
