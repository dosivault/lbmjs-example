const { DirectSecp256k1HdWallet, DirectSecp256k1Wallet, coins } = require("@cosmjs/proto-signing");

// https://github.com/satoshilabs/slips/blob/master/slip-0010.md
const { Slip10RawIndex } = require("@cosmjs/crypto");
const { SigningFinschiaClient } = require("@lbmjs/finschia");
const { GasPrice } = require("@cosmjs/stargate");

const FINSCHIA_RPC_URL = "https://dsvt-finschia-api.line-apps.com/";

const HRP_BECH32_PREFIX = "link";
const DENOM_CONY = "cony";  // 1 of 10^6

// do not reuse this sample mnemonic
// created from https://hd-keygen.vercel.app/
const MNEMONIC = "pact nose silk rocket wrestle assume tool water piece never dress zoo";
const ADDRESS_SAMPLE_BALANCE = "link1486vw3rzfsufrpza64xjdwmq4qn59jz59uaxpt";

// https://medium.com/myetherwallet/hd-wallets-and-derivation-paths-explained-865a643c7bf2
// m’ / purpose’ / coin_type’ / account’ / change / address_index
function makeLinkPath2(idx = 0, a = 0) {
    return [
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(438),   // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
        Slip10RawIndex.hardened(idx),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(a),
    ];
}

function createSendMsg(fromAddress, toAddress, amountInCony) {
    // https://github.com/cosmos/cosmjs/blob/main/packages/cli/README.md#getting-started
    return {
        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
        value: {
            fromAddress,
            toAddress,
            amount: coins(amountInCony, DENOM_CONY)
        }
    }
}

async function sendCony(client, fromWallet, toAddress, amountInCony) {
    const fromAddress = (await fromWallet.getAccounts())[0].address;
    const msgs = [createSendMsg(fromAddress, toAddress, amountInCony)];
    const response = client.signAndBroadcast(fromAddress, msgs, "auto");
    return response;
}

const main = async () => {
    console.log('Finschia coin send example');
    const senderWallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
        hdPaths: [makeLinkPath2(0, 0)],
        prefix: HRP_BECH32_PREFIX,
    });
    const senderAddress = (await senderWallet.getAccounts())[0].address;

    const receiverWallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
        hdPaths: [makeLinkPath2(0, 1)],
        prefix: HRP_BECH32_PREFIX,
    });
    const receiverAddress = (await receiverWallet.getAccounts())[0].address;

    const client = await SigningFinschiaClient.connectWithSigner(FINSCHIA_RPC_URL, senderWallet, {
        gasPrice: GasPrice.fromString("0.015cony")
    });
    const broadcastResult = await sendCony(client, senderWallet, receiverAddress, '1');
    console.log('broadcastResult', broadcastResult);

    const balances = await client.getAllBalances(ADDRESS_SAMPLE_BALANCE);
    console.log(`balances of ${ADDRESS_SAMPLE_BALANCE}`, balances);

    client.disconnect();
}

(async () => {
    await main();
})();