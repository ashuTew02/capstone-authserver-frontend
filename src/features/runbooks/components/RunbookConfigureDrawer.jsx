import React from "react";
import { Drawer, Tabs, Form, Button, Select, message } from "antd";
import {
  useGetAllAvailableTriggersQuery,
  useConfigureTriggersMutation,
  useGetRunbookTriggersQuery,
  useConfigureFiltersMutation,
  useGetRunbookFiltersQuery,
  useConfigureActionsMutation,
  useGetRunbookActionsQuery,
} from "../../../api/runbooksApi";
import {
  useGetSeveritiesQuery,
  useGetStatesQuery,
} from "../../../api/findingsApi";
import convertTextFormat from "../../../utils/convertToProperTextUtil";
import "./runbookConfigureDrawer.css";

const { TabPane } = Tabs;

function RunbookConfigureDrawer({ runbook, onClose }) {
  // Queries
  const { data: triggersData } = useGetRunbookTriggersQuery(runbook.id);
  const { data: filtersData } = useGetRunbookFiltersQuery(runbook.id);
  const { data: actionsData } = useGetRunbookActionsQuery(runbook.id);
  const { data: availableTriggers } = useGetAllAvailableTriggersQuery();

  const { data: severitiesData } = useGetSeveritiesQuery();
  const { data: statesData } = useGetStatesQuery();

  // Mutations
  const [configureTriggers] = useConfigureTriggersMutation();
  const [configureFilters] = useConfigureFiltersMutation();
  const [configureActions] = useConfigureActionsMutation();

  // Initialize forms
  const [triggerForm] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [actionForm] = Form.useForm();

  const existingTriggers = triggersData?.data || [];
  const existingFilters = filtersData?.data?.[0] || {};
  const existingActions = actionsData?.data?.[0] || {};

  // ---------------------
  // Save triggers
  // ---------------------
  const handleSaveTriggers = async () => {
    try {
      const values = await triggerForm.validateFields();
      await configureTriggers({
        runbookId: runbook.id,
        triggers: [{ triggerType: values.triggerType }],
      }).unwrap();
      message.success("Triggers updated successfully!");
    } catch (err) {
      message.error("Failed to update triggers");
    }
  };

  // ---------------------
  // Save filters
  // ---------------------
  const handleSaveFilters = async () => {
    try {
      const values = await filterForm.validateFields();
      await configureFilters({
        runbookId: runbook.id,
        state: values.state || null,
        severity: values.severity || null,
      }).unwrap();
      message.success("Filters updated successfully!");
    } catch (err) {
      message.error("Failed to update filters");
    }
  };

  // ---------------------
  // Save actions
  // ---------------------
  const handleSaveActions = async () => {
    try {
      const values = await actionForm.validateFields();
      await configureActions({
        runbookId: runbook.id,
        update: { to: values.toState || null },
        ticketCreate: !!values.ticketCreate,
      }).unwrap();
      message.success("Actions updated successfully!");
    } catch (err) {
      message.error("Failed to update actions");
    }
  };

  return (
    <Drawer
      title={`Configure Runbook #${runbook.id} - ${runbook.name}`}
      placement="right"
      width={600}
      onClose={onClose}
      open
      // Use rootClassName for custom open/close animations
    //   rootClassName="runbook-config-drawer"
      maskClosable
      destroyOnClose={false}
    >
      <Tabs defaultActiveKey="triggers">
        {/* TRIGGERS TAB */}
        <TabPane tab="Triggers" key="triggers">
          <Form
            form={triggerForm}
            layout="vertical"
            initialValues={{
              triggerType: existingTriggers[0]?.triggerType || "",
            }}
          >
            <Form.Item
              label="Trigger Type"
              name="triggerType"
              rules={[{ required: true, message: "Select a trigger type." }]}
            >
              <Select placeholder="Select trigger type">
                {availableTriggers?.data?.map((trigger) => (
                  <Select.Option key={trigger} value={trigger}>
                    {convertTextFormat(trigger)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button type="primary" onClick={handleSaveTriggers}>
              Save Triggers
            </Button>
          </Form>
        </TabPane>

        {/* FILTERS TAB */}
        <TabPane tab="Filters" key="filters">
          <Form
            form={filterForm}
            layout="vertical"
            initialValues={{
              state: existingFilters.state || undefined,
              severity: existingFilters.severity || undefined,
            }}
          >
            <Form.Item label="State" name="state">
              <Select allowClear placeholder="Select state filter">
                {statesData?.data?.data?.map((st) => (
                  <Select.Option key={st} value={st}>
                    {convertTextFormat(st)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Severity" name="severity">
              <Select allowClear placeholder="Select severity filter">
                {severitiesData?.data?.data?.map((sev) => (
                  <Select.Option key={sev} value={sev}>
                    {convertTextFormat(sev)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Button type="primary" onClick={handleSaveFilters}>
              Save Filters
            </Button>
          </Form>
        </TabPane>

        {/* ACTIONS TAB */}
        <TabPane tab="Actions" key="actions">
          <Form
            form={actionForm}
            layout="vertical"
            initialValues={{
              toState: existingActions.toState || "",
              ticketCreate: existingActions.ticketCreate || false,
            }}
          >
            <Form.Item label="To State" name="toState">
              <Select allowClear placeholder="Select to state">
                {statesData?.data?.data?.map((st) => (
                  <Select.Option key={st} value={st}>
                    {convertTextFormat(st)}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ticket Create"
              name="ticketCreate"
              valuePropName="checked"
            >
              <Select>
                <Select.Option value={false}>No</Select.Option>
                <Select.Option value={true}>Yes</Select.Option>
              </Select>
            </Form.Item>

            <Button type="primary" onClick={handleSaveActions}>
              Save Actions
            </Button>
          </Form>
        </TabPane>
      </Tabs>
    </Drawer>
  );
}

export default RunbookConfigureDrawer;
