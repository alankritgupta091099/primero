import React from "react";
import { fromJS } from "immutable";
import { useSelector } from "react-redux";
import { IconButton } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { Link } from "react-router-dom";

import { useI18n } from "../../../i18n";
import IndexTable from "../../../index-table";
import { PageHeading, PageContent } from "../../../page";
import { ROUTES } from "../../../../config";

import { selectListHeaders } from "./selectors";
import { fetchUsers } from "./action-creators";

const Container = () => {
  const i18n = useI18n();
  const recordType = "users";
  const listHeaders = useSelector(state =>
    selectListHeaders(state, recordType)
  );

  const columns = listHeaders;

  const tableOptions = {
    recordType,
    columns,
    options: {
      selectableRows: "none"
    },
    defaultFilters: fromJS({
      per: 20,
      page: 1
    }),
    onTableChange: fetchUsers
  };

  return (
    <>
      <PageHeading title={i18n.t("users.label")}>
        <IconButton
          to={ROUTES.admin_users_new}
          component={Link}
          color="primary"
        >
          <AddIcon />
        </IconButton>
      </PageHeading>
      <PageContent>
        <IndexTable {...tableOptions} />
      </PageContent>
    </>
  );
};

Container.displayName = "UsersList";

Container.propTypes = {};

export default Container;