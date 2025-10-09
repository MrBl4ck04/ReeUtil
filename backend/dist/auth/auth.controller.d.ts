import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
}
