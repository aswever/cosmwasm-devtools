import { StdSignDoc } from "@cosmjs/amino";

export function makeADR36AminoSignDoc(
  signer: string,
  data: string | Uint8Array,
): StdSignDoc {
  if (typeof data === 'string') {
    data = Buffer.from(data).toString('base64');
  } else {
    data = Buffer.from(data).toString('base64');
  }

  return {
    chain_id: '',
    account_number: '0',
    sequence: '0',
    fee: {
      gas: '0',
      amount: [],
    },
    msgs: [
      {
        type: 'sign/MsgSignData',
        value: {
          signer,
          data,
        },
      },
    ],
    memo: '',
  };
}
