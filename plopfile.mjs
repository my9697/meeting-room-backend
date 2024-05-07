export default function (plop) {
  plop.setGenerator('createBaseEntity', {
    description: 'ceate a base Entity file',
    prompts: [
      {
        type: 'input',
        name: 'pathName',
        message: 'input pathName name',
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'input entityName',
      },
    ],
    actions: (date) => {
      return [
        {
          type: 'add',
          path: './src/{{pathName}}/entities/{{entityName}}.entity.ts',
          templateFile: './template/entity/baseEntity.ts.hbs',
        },
      ];
    },
  });

  plop.setGenerator('createManyToManyEntity', {
    description: 'ceate a many to many Entity file',
    prompts: [
      {
        type: 'input',
        name: 'pathName',
        message: 'input pathName name',
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'input entityName',
      },
      {
        type: 'input',
        name: 'targetTable',
        message: 'input targetTable',
      },
    ],
    actions: (date) => {
      return [
        {
          type: 'add',
          path: './src/{{pathName}}/entities/{{entityName}}.entity.ts',
          templateFile: './template/entity/manyToManyEntity.ts.hbs',
        },
      ];
    },
  });

  plop.setGenerator('createOneToManyEntity', {
    description: 'ceate a one to many Entity file',
    prompts: [
      {
        type: 'input',
        name: 'pathName',
        message: 'input pathName name',
      },
      {
        type: 'input',
        name: 'entityName',
        message: 'input entityName',
      },
      {
        type: 'input',
        name: 'targetTable',
        message: 'input targetTable',
      },
    ],
    actions: (date) => {
      return [
        {
          type: 'add',
          path: './src/{{pathName}}/entities/{{entityName}}.entity.ts',
          templateFile: './template/entity/oneToMany.ts.hbs',
        },
      ];
    },
  });
}
