import React from "react";
import { Descriptions, Typography } from "antd";
import convertTextFormat from "../../../utils/convertToProperTextUtil";

const { Text } = Typography;

const FindingDetailsKeyValueTable = ({ finding }) => {
  // Safe checks
  if (!finding) return null;

  const cwes = finding.cwes || [];

  return (
    <div className="finding-keyvalue-table">
      <Descriptions
        bordered
        size="small"
        column={1}
        labelStyle={{ width: "30%", fontWeight: 600 }}
        contentStyle={{ width: "70%" }}
      >
        <Descriptions.Item label="Title">
          {finding.title || "No Title"}
        </Descriptions.Item>
        <Descriptions.Item label="ID">{finding.id || "No ID"}</Descriptions.Item>
        <Descriptions.Item label="Tool">
          {convertTextFormat(finding.toolType || "")}
        </Descriptions.Item>
        <Descriptions.Item label="Severity">
          {finding.severity || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="State">
          {convertTextFormat(finding.state || "")}
        </Descriptions.Item>
        <Descriptions.Item label="CVSS">{finding.cvss || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="CVE">{finding.cve || "N/A"}</Descriptions.Item>
        <Descriptions.Item label="File Path">
          {finding.filePath || "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="CWEs">
          {cwes.length === 0
            ? "N/A"
            : cwes.map((cwe, idx) => {
                const match = cwe.match(/^CWE-(\d+)$/);
                if (match) {
                  const cweNumber = match[1].replace(/^0+/, "");
                  const isLast = idx === cwes.length - 1;
                  return (
                    <React.Fragment key={`${cwe}-${idx}`}>
                      <a
                        href={`https://cwe.mitre.org/data/definitions/${cweNumber}.html`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {cwe}
                      </a>
                      {!isLast && ", "}
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={`${cwe}-${idx}`}>
                    {cwe}
                    {idx < cwes.length - 1 && ", "}
                  </React.Fragment>
                );
              })}
        </Descriptions.Item>
      </Descriptions>
    </div>
  );
};

export default FindingDetailsKeyValueTable;
