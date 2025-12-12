import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations1764245206953 implements MigrationInterface {
  name = 'Migrations1764245206953';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // diarys 테이블이 이미 존재하는지 확인
    const tableExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'diarys'
            );
        `);

    if (!tableExists[0].exists) {
      await queryRunner.query(
        `CREATE TABLE "diarys" ("id" SERIAL NOT NULL, "date" date NOT NULL, "time" TIME NOT NULL, "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, CONSTRAINT "PK_d9a1f51d2372efe9779843283ab" PRIMARY KEY ("id"))`,
      );
      await queryRunner.query(
        `ALTER TABLE "diarys" ADD CONSTRAINT "FK_14f0abd6fb2ce4cd346242f114e" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      );
    }

    // posts 테이블의 컬럼이 존재하는지 확인 후 삭제
    const startTimeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'posts' 
                AND column_name = 'startTime'
            );
        `);

    if (startTimeExists[0].exists) {
      await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "startTime"`);
    }

    const endTimeExists = await queryRunner.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.columns 
                WHERE table_schema = 'public' 
                AND table_name = 'posts' 
                AND column_name = 'endTime'
            );
        `);

    if (endTimeExists[0].exists) {
      await queryRunner.query(`ALTER TABLE "posts" DROP COLUMN "endTime"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "diarys" DROP CONSTRAINT "FK_14f0abd6fb2ce4cd346242f114e"`,
    );
    await queryRunner.query(`ALTER TABLE "posts" ADD "endTime" TIME`);
    await queryRunner.query(`ALTER TABLE "posts" ADD "startTime" TIME`);
    await queryRunner.query(`DROP TABLE "diarys"`);
  }
}
