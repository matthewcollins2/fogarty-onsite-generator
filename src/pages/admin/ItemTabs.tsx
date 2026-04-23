import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import GeneratorTable from './GeneratorTable';
import PartsTable from './PartsTable';

// generator and parts tab from inventory-management page
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/* displays tab selected (generators/parts) and hides the others */
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

/* allows tabs to be accessible */
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function ItemTabs() {
  const [value, setValue] = React.useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange}>
          <Tab label="Generators" {...a11yProps(0)}/>
          <Tab label="Parts" {...a11yProps(1)}/>
        </Tabs>
      </Box>
        <CustomTabPanel value={value} index={0}>
          <GeneratorTable></GeneratorTable>
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <PartsTable></PartsTable>
        </CustomTabPanel>
    </Box>
  );
}

export default ItemTabs;