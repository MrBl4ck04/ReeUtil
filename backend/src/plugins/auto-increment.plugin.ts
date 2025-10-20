import { Schema } from 'mongoose';

export function autoIncrementPlugin(schema: Schema, options: { field: string }) {
  schema.pre('save', async function (next) {
    if (this.isNew) {
      // Use a loose any type for Model to avoid TS errors when calling static methods
      const Model: any = this.constructor;
      const lastDoc = await Model.findOne().sort({ [options.field]: -1 });
      const nextId = lastDoc ? lastDoc[options.field] + 1 : 1;
      this[options.field] = nextId;
    }
    next();
  });
}
