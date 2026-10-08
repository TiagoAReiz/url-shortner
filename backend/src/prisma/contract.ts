import { defineContract } from '@prisma/orm-postgres/contract-builder';

export const contract = defineContract({}, ({ field, model, rel }) => {
  const Shortner = model ("Shortner", {
    fields:{
      id: field.text(),
      destination_url: field.text(),
      created_at: field.dateTime(),
      expires_at: field.dateTime()

    }
  })
  const Access = model("Access", {
    fields:{
      id: field.bigint(),
      shortner_id: field.text(),
      accessed_at: field.dateTime(),
      made_by: field.text(),
    }
  })

  return {
    models: {
      Shortner,
      Access
    },
  };
});
