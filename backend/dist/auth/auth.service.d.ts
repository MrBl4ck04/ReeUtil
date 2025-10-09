import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private userModel;
    private jwtService;
    constructor(userModel: Model<UserDocument>, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        user: {
            idUsuario: number;
            nombre: string;
            apellido: string;
            email: string;
            rol: boolean;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            idUsuario: number;
            nombre: string;
            apellido: string;
            email: string;
            rol: boolean;
        };
        redirect: string;
    }>;
    validateUser(userId: number): Promise<any>;
}
