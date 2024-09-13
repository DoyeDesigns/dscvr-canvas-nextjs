// import type { NextApiRequest, NextApiResponse } from 'next'
 
// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'POST') {
//     // Process a POST request
//   } else {
//     // Handle any other HTTP method
//   }
// }

import { ActionGetResponse, ACTIONS_CORS_HEADERS, ActionError } from '@solana/actions';

export const GET = async (req: Request) => {
    const payload: ActionGetResponse ={
        icon: new URL('/next.svg', new URL(req.url).origin).toString(),
        label: 'Solana Tool Hub',
        title: 'Solana Tool Hub',
        description: 'Solana Tool Hub DSCVR Blinks'
    };

        return Response.json(payload, {
            headers: ACTIONS_CORS_HEADERS,
        })
}

export const OPTIONS = GET;

export const POST = async (req: Request) => {
    try {
        const body = await req.text();
    } catch (error) {
        let message = 'An unknown error occured'
        // if (typeof error === string) message = error 
        return Response.json( {
            message: 'error'
        }, {
            headers: ACTIONS_CORS_HEADERS,
        })
    }
}