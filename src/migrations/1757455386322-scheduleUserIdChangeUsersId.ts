import { MigrationInterface, QueryRunner } from "typeorm";

export class ScheduleUserIdChangeUsersId1757455386322 implements MigrationInterface {
    name = 'ScheduleUserIdChangeUsersId1757455386322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username")`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_8bf09ba754322ab9c22a215c919"`);
    }

}
