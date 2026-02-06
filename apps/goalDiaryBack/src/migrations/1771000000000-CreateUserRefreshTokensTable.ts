import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserRefreshTokensTable1771000000000 implements MigrationInterface {
  name = 'CreateUserRefreshTokensTable1771000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_refresh_tokens" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "tokenHash" character varying(255) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "expiresAt" TIMESTAMPTZ,
        "userId" uuid NOT NULL,
        CONSTRAINT "PK_user_refresh_tokens_id" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_refresh_tokens" ADD CONSTRAINT "FK_user_refresh_tokens_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_refresh_tokens" DROP CONSTRAINT "FK_user_refresh_tokens_userId"`,
    );
    await queryRunner.query(`DROP TABLE "user_refresh_tokens"`);
  }
}
