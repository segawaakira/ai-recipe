"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserInput = void 0;
var zod_1 = require("zod");
exports.CreateUserInput = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .regex(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/, "Password must contain both letters and numbers"),
});
