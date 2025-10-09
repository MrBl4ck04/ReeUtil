"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../schemas/user.schema");
let AuthService = class AuthService {
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(registerDto) {
        const { email, contraseA, ...userData } = registerDto;
        const existingUser = await this.userModel.findOne({ email });
        if (existingUser) {
            throw new common_1.ConflictException('El usuario ya existe');
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contraseA, salt);
        const rol = email.endsWith('@adm.bo');
        const newUser = new this.userModel({
            ...userData,
            email,
            contraseA: hashedPassword,
            rol,
        });
        await newUser.save();
        return {
            message: 'Usuario registrado con éxito',
            user: {
                idUsuario: newUser.idUsuario,
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                email: newUser.email,
                rol: newUser.rol,
            },
        };
    }
    async login(loginDto) {
        const { email, contraseA } = loginDto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const isPasswordValid = await bcrypt.compare(contraseA, user.contraseA);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Credenciales inválidas');
        }
        const payload = {
            sub: user.idUsuario,
            email: user.email,
            rol: user.rol,
        };
        const token = this.jwtService.sign(payload);
        return {
            access_token: token,
            user: {
                idUsuario: user.idUsuario,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                rol: user.rol,
            },
            redirect: user.rol ? '/admin' : '/client',
        };
    }
    async validateUser(userId) {
        const user = await this.userModel.findOne({ idUsuario: userId });
        if (user) {
            const { contraseA, ...result } = user.toObject();
            return result;
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map