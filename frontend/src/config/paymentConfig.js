// Fill these in with your real account details - customers will see these
// exact numbers/names at checkout and send payment directly to them.
// No API keys, no merchant account, no fees. You just check the account
// yourself and confirm each order's payment in the admin panel.

const paymentConfig = {
  JazzCash: {
    label: "JazzCash",
    accountTitle: "Your Name Here",
    accountNumber: "03XXXXXXXXX",
    instructions: "Send the total amount via JazzCash mobile account to the number above, then enter the transaction ID below.",
  },
  Easypaisa: {
    label: "Easypaisa",
    accountTitle: "Your Name Here",
    accountNumber: "03XXXXXXXXX",
    instructions: "Send the total amount via Easypaisa mobile account to the number above, then enter the transaction ID below.",
  },
  BankTransfer: {
    label: "Bank Transfer",
    accountTitle: "Your Name Here",
    accountNumber: "PKXX XXXX XXXX XXXX XXXX XXXX",
    bankName: "Your Bank Name",
    instructions: "Transfer the total amount to the account above, then enter the transaction/reference ID below.",
  },
};

export default paymentConfig;
