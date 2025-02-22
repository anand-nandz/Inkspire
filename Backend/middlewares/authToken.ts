import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import dotenv from 'dotenv'
import { AuthenticatedRequest } from '../types/authReq';
import HTTP_statusCode from '../utils/httpStatusCode';
import { Messages } from '../utils/messages';

dotenv.config()

interface UserJwtPayload extends JwtPayload {
  _id: string;
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];
console.log(token,'token');

  if (!token) {
    res.status(HTTP_statusCode.Unauthorized).json({ expired: true, message: Messages.Auth.AUTHENTICATION_REQUIRED });
    return;
  }
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(HTTP_statusCode.NoAccess).json({ message: Messages.Auth.AUTHENTICATION_REQUIRED });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY!, (err, decoded) => {
    if (err) {
      res.status(HTTP_statusCode.Unauthorized).json({ message: Messages.Warning.TOKEN_NOT_VALID });
      return;
    }

    const user = decoded as UserJwtPayload;

    if (user && user._id) {
      req.user = {
        _id: new Types.ObjectId(user._id),
      };
      next();
    } else {
      res.status(HTTP_statusCode.NoAccess).json({ message: Messages.Warning.INVALID_PAYLOAD });
    }
  });
};



