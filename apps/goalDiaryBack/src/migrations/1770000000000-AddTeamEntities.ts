import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddTeamEntities1770000000000 implements MigrationInterface {
  name = 'AddTeamEntities1770000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'teams',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '255', isNullable: false },
          {
            name: 'ownerId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'team_users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'teamId', type: 'int', isNullable: false },
          { name: 'userId', type: 'uuid', isNullable: false },
          {
            name: 'role',
            type: 'varchar',
            length: '20',
            default: `'MEMBER'`,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: `'PENDING'`,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    await queryRunner.addColumn(
      'schedules',
      new TableColumn({
        name: 'teamId',
        type: 'int',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'teams',
      new TableForeignKey({
        columnNames: ['ownerId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'team_users',
      new TableForeignKey({
        columnNames: ['teamId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'teams',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'team_users',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'schedules',
      new TableForeignKey({
        columnNames: ['teamId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'teams',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const schedulesTable = await queryRunner.getTable('schedules');
    const teamIdFk = schedulesTable?.foreignKeys.find((fk) =>
      fk.columnNames.includes('teamId'),
    );
    if (teamIdFk) {
      await queryRunner.dropForeignKey('schedules', teamIdFk);
    }
    await queryRunner.dropColumn('schedules', 'teamId');

    const teamUsersTable = await queryRunner.getTable('team_users');
    if (teamUsersTable) {
      for (const fk of teamUsersTable.foreignKeys) {
        await queryRunner.dropForeignKey('team_users', fk);
      }
    }
    await queryRunner.dropTable('team_users');

    const teamsTable = await queryRunner.getTable('teams');
    if (teamsTable) {
      for (const fk of teamsTable.foreignKeys) {
        await queryRunner.dropForeignKey('teams', fk);
      }
    }
    await queryRunner.dropTable('teams');
  }
}
