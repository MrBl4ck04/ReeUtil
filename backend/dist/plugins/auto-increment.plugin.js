"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoIncrementPlugin = autoIncrementPlugin;
function autoIncrementPlugin(schema, options) {
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
//# sourceMappingURL=auto-increment.plugin.js.map