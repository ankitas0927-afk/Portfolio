import type { NextApiHandler } from 'next';

import { handleNextApiRequest } from '@ankita-portfolio/api/runtime';

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
    responseLimit: false,
  },
};

const handler: NextApiHandler = async (request, response) => {
  await handleNextApiRequest(request, response);
};

export default handler;
