import { Schema } from 'mongoose';

export function autoIncrementPlugin(schema: Schema, options: { field: string }) {
  schema.pre('save', async function (next) {
    if (this.isNew) {
      const Model = this.constructor;
      const lastDoc = await Model.findOne().sort({ [options.field]: -1 });
      const nextId = lastDoc ? lastDoc[options.field] + 1 : 1;
      this[options.field] = nextId;
    }
    next();
  });
}
