import * as jwt from 'jsonwebtoken';

export const ACCESS_SECRET_TOKEN =
	'e1ba726da7e44ddd3945fab98e99fa0fb417c8eb63d60c555299f682d460ca9434b619de5d211fa3dbdff8274ab7adcafc5820844411b3b143748af986b6d1b7';

export interface AuthTokenPayload {
	userId: number;
}

export const decodeAuthHeader = (authHeader: string): AuthTokenPayload => {
	const token = authHeader.split(' ')[1];
	if (!token) throw new Error('No Token Found');
	return jwt.verify(token, ACCESS_SECRET_TOKEN) as AuthTokenPayload;
};
