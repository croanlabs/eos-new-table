#include <eosiolib/eosio.hpp>

using namespace eosio;

class <%= name %> : public eosio::contract {
  public:
    using contract::contract;

    <%=name%>(account_name self):
      contract(self),
      <%=tableName%>(_self, _self) {}

    /// @abi action
    void insert_<%= name %>(<% /* TODO: add list of fields */%>) {
      <%= name %>s.emplace(_self, [&](auto& new_<%= name %>) {
        new_<%= name %>.id = <%=tableName%>.available_primary_key();
        <% fields.forEach((field) => { %>new_<%= name %>.<%= field[1] %> = <%= field[1] %>;
        <%})%>
      });
    }

  private:
    // @abi table <%= tableName %> i64
    struct <%=name%> {
      uint64_t id;
      <% fields.forEach((field) => { %><%= field[0] %> <%= field[1] %>;
      <%})%>
      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(<%= name %>, <% fields.forEach((field) => { %>(<%= field[1] %>)<%})%>)
    };

    eosio::multi_index<N(<%=name%>), <%=name%>> <%=tableName%>;
};

EOSIO_ABI(<%= name %>, (insert_<%= name %>))
