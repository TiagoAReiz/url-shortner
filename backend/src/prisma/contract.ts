import {
  autoincrement,
  defineContract,
} from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model }) => {
  const User = model('User', {
    fields: {
      id: field.text().id(),
      google_sub: field.text().unique(),
      email: field.text().unique(),
      name: field.text().optional(),
      picture: field.text().optional(),
      created_at: field.dateTime(),
    },
  });

  const Shortner = model('Shortner', {
    fields: {
      id: field.text().id(),
      destination_url: field.text(),
      created_at: field.dateTime(),
      expires_at: field.dateTime(),
      // null = link anônimo (sem dono)
      user_id: field.text().optional(),
    },
  });

  const Access = model('Access', {
    fields: {
      id: field.bigint().id().default(autoincrement()),
      shortner_id: field.text(),
      accessed_at: field.dateTime(),
      ip: field.text().optional(),
      user_agent: field.text().optional(),
      referer: field.text().optional(),
    },
  });

  return {
    models: {
      User,
      Shortner,
      Access,
    },
  };
});
