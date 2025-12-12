import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotificationEntity1765471076303 implements MigrationInterface {
  name = 'AddNotificationEntity1765471076303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" SERIAL NOT NULL, "type" character varying(50) NOT NULL, "message" text NOT NULL, "metadata" json, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );

    // team_users 테이블이 존재할 때만 실행
    const teamUsersTableExists = await queryRunner.hasTable('team_users');
    if (teamUsersTableExists) {
      await queryRunner.query(
        `ALTER TABLE "team_users" ALTER COLUMN "createdAt" SET DEFAULT now()`,
      );
    }

    // teams 테이블이 존재할 때만 실행
    const teamsTableExists = await queryRunner.hasTable('teams');
    if (teamsTableExists) {
      await queryRunner.query(
        `ALTER TABLE "teams" ALTER COLUMN "createdAt" SET DEFAULT now()`,
      );
      await queryRunner.query(
        `ALTER TABLE "teams" ALTER COLUMN "updatedAt" SET DEFAULT now()`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_692a909ee0fa9383e7859f9b406" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_692a909ee0fa9383e7859f9b406"`,
    );

    // teams 테이블이 존재할 때만 실행
    const teamsTableExists = await queryRunner.hasTable('teams');
    if (teamsTableExists) {
      await queryRunner.query(
        `ALTER TABLE "teams" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP`,
      );
      await queryRunner.query(
        `ALTER TABLE "teams" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
      );
    }

    // team_users 테이블이 존재할 때만 실행
    const teamUsersTableExists = await queryRunner.hasTable('team_users');
    if (teamUsersTableExists) {
      await queryRunner.query(
        `ALTER TABLE "team_users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`,
      );
    }

    await queryRunner.query(`DROP TABLE "notifications"`);
  }
}
