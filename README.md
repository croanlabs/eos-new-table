# eos-new-table
Generate EOS C++ smart contract to create a table on the blockchain.

## Install
Install it globally with:

```bash
npm i -g eos-new-table
```

## Usage
### Options
```bash
$ eos-new-table

Generate EOS C++ smart contract to create a table on the blockchain.
  Options:
  --name          Name of the element to be represented. e.g. user
  --attributes    Semicolon separated list of attributes of the element with their types.
                  e.g. 'std::string name; uint64_t token_amount'
  --table-name    Name of the table to be created. If not defined the name parameter will be used.
  --help          Show this help message.
  
 ```
 ### Example
 ```bash
 $ eos-new-table --name user --table-name users --attributes 'std::string name; uint64_t tokens_amount'
 ```
 
 #### user.cpp
 ```c++
#include <eosiolib/eosio.hpp>

using namespace eosio;

class user_management : public eosio::contract {
  public:
    using contract::contract;

    user_management(account_name self):
      contract(self),
      users(_self, _self) {}

    /// @abi action
    void insert(std::string name, uint64_t tokens_amount) {
      users.emplace(_self, [&](auto& new_user) {
        new_user.id = users.available_primary_key();
        new_user.name = name;
        new_user.tokens_amount = tokens_amount;
      });
    }

  private:
    // @abi table users i64
    struct user {
      uint64_t id;
      std::string name;
      uint64_t tokens_amount;

      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(user, (id)(name)(tokens_amount))
    };

    eosio::multi_index<N(users), user> users;
};

EOSIO_ABI(user_management, (insert))
 ```
