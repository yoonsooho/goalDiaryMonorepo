import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764243843948 implements MigrationInterface {
  name = 'Migrations1764243843948';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "diarys" ("id" SERIAL NOT NULL, "date" date NOT NULL, "time" TIME NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_d9a1f51d2372efe9779843283ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "diarys" ADD CONSTRAINT "FK_14f0abd6fb2ce4cd346242f114e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "diarys" DROP CONSTRAINT "FK_14f0abd6fb2ce4cd346242f114e"`,
    );
    await queryRunner.query(`DROP TABLE "diarys"`);
  }
}
