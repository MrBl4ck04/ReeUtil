import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, contraseA, ...userData } = registerDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('El usuario ya existe');
    }

    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contraseA, salt);

    // Asignar rol basado en el dominio del correo
    const rol = email.endsWith('@adm.bo');

    // Crear nuevo usuario
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

  async login(loginDto: LoginDto) {
    const { email, contraseA } = loginDto;

    // Buscar usuario
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(contraseA, user.contraseA);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Generar JWT
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

  async validateUser(userId: number): Promise<any> {
    const user = await this.userModel.findOne({ idUsuario: userId });
    if (user) {
      const { contraseA, ...result } = user.toObject();
      return result;
    }
    return null;
  }
}
