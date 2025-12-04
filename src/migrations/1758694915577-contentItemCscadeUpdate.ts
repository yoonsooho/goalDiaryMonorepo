import { MigrationInterface, QueryRunner } from "typeorm";

export class ContentItemCscadeUpdate1758694915577 implements MigrationInterface {
    name = 'ContentItemCscadeUpdate1758694915577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "content_items" DROP CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6"`);
        await queryRunner.query(`ALTER TABLE "content_items" ADD CONSTRAINT "FK_67e25fccd3f06b875f30b0ddaf6" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
