import React, { useEffect, memo, useState } from "react";
import PropTypes from "prop-types";
import { useMediaQuery } from "@material-ui/core";
import { useSelector, useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import { withRouter } from "react-router-dom";
import clsx from "clsx";

import { useThemeHelper } from "../../libs";
import { useI18n } from "../i18n";
import { PageContainer } from "../page";
import { Transitions, fetchTransitions } from "../transitions";
import { LoadingIndicator } from "../loading-indicator";
import { fetchRecord, saveRecord, selectRecord } from "../records";
import { RECORD_TYPES, TRANSITION_TYPE, REFERRAL } from "../../config";

import { Nav } from "./nav";
import { RecordForm, RecordFormToolbar } from "./form";
import styles from "./styles.css";
import {
  getFirstTab,
  getFormNav,
  getRecordForms,
  getLoadingState,
  getErrors,
  getSelectedForm
} from "./selectors";
import { compactValues } from "./helpers";

const RecordForms = ({ match, mode }) => {
  let submitForm = null;
  const { theme } = useThemeHelper(styles);
  const mobileDisplay = useMediaQuery(theme.breakpoints.down("sm"));

  const containerMode = {
    isNew: mode === "new",
    isEdit: mode === "edit",
    isShow: mode === "show"
  };

  const css = makeStyles(styles)();
  const dispatch = useDispatch();
  const i18n = useI18n();
  const { params } = match;
  const recordType = RECORD_TYPES[params.recordType];

  const record = useSelector(state =>
    selectRecord(state, containerMode, params.recordType, params.id)
  );

  const selectedModule = {
    recordType,
    primeroModule: record ? record.get("module_id") : params.module
  };

  const formNav = useSelector(state => getFormNav(state, selectedModule));
  const forms = useSelector(state => getRecordForms(state, selectedModule));
  const firstTab = useSelector(state => getFirstTab(state, selectedModule));
  const loading = useSelector(state => getLoadingState(state));
  const errors = useSelector(state => getErrors(state));
  const selectedForm = useSelector(state => getSelectedForm(state));

  const handleFormSubmit = e => {
    if (submitForm) {
      submitForm(e);
    }
  };

  const [toggleNav, setToggleNav] = useState(false);

  const handleToggleNav = () => {
    setToggleNav(!toggleNav);
  };

  const formProps = {
    onSubmit: (initialValues, values) => {
      dispatch(
        saveRecord(
          params.recordType,
          containerMode.isEdit ? "update" : "save",
          {
            data: {
              ...compactValues(values, initialValues),
              ...(!containerMode.isEdit
                ? { module_id: selectedModule.primeroModule }
                : {})
            }
          },
          params.id,
          containerMode.isEdit
            ? i18n.t(`${recordType}.messages.update_success`, {
                record_id: record.get("short_id")
              })
            : i18n.t(`${recordType}.messages.creation_success`, recordType),
          `/${params.recordType}/${params.id}`
        )
      );
      // TODO: Set this if there are any errors on validations
      // setSubmitting(false);
    },
    bindSubmitForm: boundSubmitForm => {
      submitForm = boundSubmitForm;
    },
    handleToggleNav,
    mobileDisplay,
    selectedForm,
    forms,
    mode: containerMode,
    record,
    recordType: params.recordType
  };

  const toolbarProps = {
    mode: containerMode,
    params,
    recordType,
    handleFormSubmit,
    shortId: record ? record.get("short_id") : null,
    primeroModule: selectedModule.primeroModule,
    record
  };

  const navProps = {
    formNav,
    selectedForm,
    firstTab,
    handleToggleNav,
    mobileDisplay
  };

  useEffect(() => {
    if (params.id && (containerMode.isShow || containerMode.isEdit)) {
      dispatch(fetchRecord(params.recordType, params.id));
    }
  }, [
    containerMode.isEdit,
    containerMode.isShow,
    dispatch,
    params.id,
    params.recordType
  ]);

  useEffect(() => {
    dispatch(fetchTransitions(params.recordType, params.id));
  }, [params.recordType, params.id]);

  // TODO: When transfer_request be implement change the transition_ype
  const isTransition = TRANSITION_TYPE.includes(selectedForm);
  const transitionProps = {
    isReferral: REFERRAL === selectedForm,
    recordType: params.recordType,
    record: params.id
  };

  return (
    <PageContainer twoCol>
      <LoadingIndicator
        hasData={!!(forms && formNav && firstTab)}
        type={params.recordType}
        loading={loading}
        errors={errors}
      >
        <RecordFormToolbar {...toolbarProps} />
        <div
          className={clsx(css.recordContainer, {
            [css.formNavOpen]: toggleNav && mobileDisplay
          })}
        >
          <div className={css.recordNav}>
            <Nav {...navProps} />
          </div>
          <div className={`${css.recordForms} record-form-container`}>
            {isTransition ? (
              <Transitions {...transitionProps} />
            ) : (
              <RecordForm {...formProps} />
            )}
          </div>
        </div>
      </LoadingIndicator>
    </PageContainer>
  );
};

RecordForms.propTypes = {
  match: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired
};

export default memo(withRouter(RecordForms));
