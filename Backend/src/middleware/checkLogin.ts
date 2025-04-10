import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HttpMessage, HttpStatus } from 'src/global/enums/enum';
import { ResponeData } from 'src/global/responses/responses.global';
import { jwtConstants } from 'src/auth/constants';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class checkLogin implements NestMiddleware {
  constructor(private jwtService: JwtService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json(
          new ResponeData<null>(
            HttpMessage.NOTLOGIN_MESSAGE,
            HttpStatus.NOT_FOUND,
            null,
          ),
        );
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      req['user'] = payload;
      console.log(req['user']);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            new ResponeData<null>(
              HttpMessage.EXPIRESTOKEN_MESSAGE,
              HttpStatus.UNAUTHORIZED,
              null,
            ),
          );
      } else if (error.name === 'JsonWebTokenError') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            new ResponeData<null>(
              HttpMessage.INVALIDTOKEN_MESSAGE,
              HttpStatus.UNAUTHORIZED,
              null,
            ),
          );
      } else if (error.name === 'NotBeforeError') {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(
            new ResponeData<null>(
              HttpMessage.INVALIDTOKEN_MESSAGE,
              HttpStatus.UNAUTHORIZED,
              null,
            ),
          );
      } else {
        throw new UnauthorizedException();
      }
    }
  }
}
