#include <eosiolib/eosio.hpp>

using namespace eosio;

class <%= className %> : public eosio::contract {
  public:
    using contract::contract;

    <%=className%>(account_name self):
      contract(self),
      <%=tableName%>(_self, _self) {}

    /// @abi action
    void insert_<%= name %>(<%= attrsParamList %>) {
      <%= tableName %>.emplace(_self, [&](auto& new_<%= name %>) {
        new_<%= name %>.id = <%=tableName%>.available_primary_key();<%= insertAssigns %>
      });
    }

  private:
    // @abi table <%= tableName %> i64
    struct <%=name%> {
      uint64_t id;
      <% attrs.forEach((attr) => { %><%= attr[0] %> <%= attr[1] %>;
      <%})%>
      uint64_t primary_key() const { return id; };
      EOSLIB_SERIALIZE(<%= name %>, <% attrs.forEach((attr) => { %>(<%= attr[1] %>)<%})%>)
    };

    eosio::multi_index<N(<%=name%>), <%=name%>> <%=tableName%>;
};

EOSIO_ABI(<%= className %>, (insert_<%= name %>))
