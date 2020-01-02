import { expect } from "chai";
import { fromJS } from "immutable";

import { DASHBOARD_NAMES } from "./constants";
import * as selectors from "./selectors";

const workflowTeamCases = {
  name: DASHBOARD_NAMES.WORKFLOW_TEAM,
  type: "indicator",
  stats: {
    primero: {
      new: {
        count: 2,
        query: ["record_state=true", "status=open", "risk_level=high"]
      }
    },
    primero_cp: {
      new: {
        count: 1,
        query: ["record_state=true", "status=open", "risk_level=high"]
      }
    }
  }
};

const stateWithoutRecords = fromJS({});
const initialState = fromJS({
  records: {
    dashboard: {
      data: [
        {
          name: "dashboard.case_risk",
          type: "indicator",
          stats: {
            high: {
              count: 2,
              query: ["record_state=true", "status=open", "risk_level=high"]
            },
            medium: {
              count: 1,
              query: ["record_state=true", "status=open", "risk_level=medium"]
            },
            none: {
              count: 0,
              query: ["record_state=true", "status=open", "risk_level=none"]
            }
          }
        },
        workflowTeamCases
      ]
    }
  }
});

describe("<Dashboard /> - Selectors", () => {
  describe("getCasesByAssessmentLevel", () => {
    it("should return a list of dashboard", () => {
      const records = selectors.getCasesByAssessmentLevel(initialState);

      const expected = fromJS({
        name: DASHBOARD_NAMES.CASE_RISK,
        type: "indicator",
        stats: {
          high: {
            count: 2,
            query: ["record_state=true", "status=open", "risk_level=high"]
          },
          medium: {
            count: 1,
            query: ["record_state=true", "status=open", "risk_level=medium"]
          },
          none: {
            count: 0,
            query: ["record_state=true", "status=open", "risk_level=none"]
          }
        }
      });

      expect(records).to.deep.equal(expected);
    });
  });

  describe("getWorkflowTeamCases", () => {
    it("should return list of headers allowed to the user", () => {
      const values = selectors.getWorkflowTeamCases(initialState);

      expect(values).to.deep.equal(fromJS(workflowTeamCases));
    });

    it("should return false when there are not users in store", () => {
      const values = selectors.getWorkflowTeamCases(stateWithoutRecords);

      expect(values).to.be.empty;
    });
  });
});