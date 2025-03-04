export const contracts = {
  basic: `use alkanes_runtime::declare_alkane;
use alkanes_runtime::runtime::AlkaneResponder;
use alkanes_support::response::CallResponse;
use metashrew_support::compat::{to_arraybuffer_layout, to_passback_ptr};
use anyhow::Result;

#[derive(Default)]
pub struct MyContract(());

impl AlkaneResponder for MyContract {
    fn execute(&self) -> Result<CallResponse> {
        let context = self.context()?;
        let mut inputs = context.inputs.clone();
        let mut response = CallResponse::forward(&context.incoming_alkanes);

        // Your opcode handling logic here

        Ok(response)
    }
}

declare_alkane!{MyContract}`,
  simpleStorage: `use alkanes_runtime::declare_alkane;
use alkanes_runtime::runtime::AlkaneResponder;
use alkanes_support::response::CallResponse;
use metashrew_support::compat::{to_arraybuffer_layout, to_passback_ptr};
use anyhow::Result;

#[derive(Default)]
pub struct SimpleStorageContract(());

impl AlkaneResponder for SimpleStorageContract {
    pub fn some_value_pointer(&self) -> StoragePointer {
        StoragePointer::from_keyword("/some-value")
    }

    // Getter
    pub fn some_value(&self) -> u128 {
        self.some_value_pointer().get_value::<u128>()
    }

    // Setter
    pub fn set_some_value(&self, v: u128) {
        self.some_value_pointer().set_value::<u128>(v);
    }
        
    fn execute(&self) -> Result<CallResponse> {
        let context = self.context()?;
        let mut inputs = context.inputs.clone();
        let mut response = CallResponse::forward(&context.incoming_alkanes);

        // Your opcode handling logic here

        Ok(response)
    }
}

declare_alkane!{MyContract}`,
  tokenTransfer: `use alkanes_runtime::declare_alkane;
use alkanes_runtime::runtime::AlkaneResponder;
use alkanes_support::response::CallResponse;
use metashrew_support::compat::{to_arraybuffer_layout, to_passback_ptr};
use anyhow::Result;

#[derive(Default)]
pub struct TokenTransfer {
    balances: std::collections::HashMap<String, u64>,
}

impl AlkaneResponder for TokenTransfer {
    fn execute(&self) -> Result<CallResponse> {
        let context = self.context()?;
        let mut inputs = context.inputs.clone();
        let mut response = CallResponse::forward(&context.incoming_alkanes);

        let from = inputs.next().unwrap_or_default();
        let to = inputs.next().unwrap_or_default();
        let amount: u64 = inputs.next().unwrap_or_default().parse().unwrap_or(0);

        if let Some(from_balance) = self.balances.get_mut(&from) {
            if *from_balance >= amount {
                *from_balance -= amount;
                *self.balances.entry(to).or_insert(0) += amount;
                response.set_data(b"Transfer successful".to_vec());
            } else {
                response.set_data(b"Insufficient balance".to_vec());
            }
        } else {
            response.set_data(b"Sender not found".to_vec());
        }

        Ok(response)
    }
}

declare_alkane!{TokenTransfer}`,
  orbital: `use alkanes_runtime::declare_alkane;
use alkanes_runtime::{runtime::AlkaneResponder, storage::StoragePointer, token::Token};
use alkanes_support::{parcel::AlkaneTransfer, response::CallResponse, utils::shift_or_err};
use anyhow::{anyhow, Result};
use hex_lit::hex;
use metashrew_support::compat::{to_arraybuffer_layout, to_passback_ptr};
use metashrew_support::index_pointer::KeyValuePointer;

#[derive(Default)]
pub struct Orbital(());

impl Token for Orbital {
    fn name(&self) -> String {
        String::from("NFT")
    }
    fn symbol(&self) -> String {
        String::from("NFT")
    }
}

impl Orbital {
    pub fn total_supply_pointer(&self) -> StoragePointer {
        StoragePointer::from_keyword("/totalsupply")
    }
    pub fn total_supply(&self) -> u128 {
        self.total_supply_pointer().get_value::<u128>()
    }
    pub fn set_total_supply(&self, v: u128) {
        self.total_supply_pointer().set_value::<u128>(v);
    }
    pub fn observe_initialization(&self) -> Result<()> {
        let mut initialized_pointer = StoragePointer::from_keyword("/initialized");
        if initialized_pointer.get().len() == 0 {
            initialized_pointer.set_value::<u32>(1);
            Ok(())
        } else {
            Err(anyhow!("already initialized"))
        }
    }
    pub fn data(&self) -> Vec<u8> {
        // in this reference implementation, we return a 1x1 PNG
        // NFT data can be anything, however
        (&hex!("89504e470d0a1a0a0000000d494844520000000100000001010300000025db56ca00000003504c5445000000a77a3dda0000000174524e530040e6d8660000000a4944415408d76360000000020001e221bc330000000049454e44ae426082")).to_vec()
    }
}

impl AlkaneResponder for Orbital {
    fn execute(&self) -> Result<CallResponse> {
        let context = self.context()?;
        let mut inputs = context.inputs.clone();
        let mut response = CallResponse::forward(&context.incoming_alkanes);
        match shift_or_err(&mut inputs)? {
            0 => {
                self.observe_initialization()?;
                self.set_total_supply(1);
                response.alkanes.0.push(AlkaneTransfer {
                    id: context.myself.clone(),
                    value: 1u128,
                });
            }
            99 => {
                response.data = self.name().into_bytes().to_vec();
            }
            100 => {
                response.data = self.symbol().into_bytes().to_vec();
            }
            101 => {
                response.data = (&self.total_supply().to_le_bytes()).to_vec();
            }
            1000 => response.data = self.data(),
            _ => return Err(anyhow!("unrecognized opcode")),
        }
        Ok(response)
    }
}

declare_alkane! {Orbital}`,
};
