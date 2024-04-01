import { Box, Tab, Tabs, Typography, Accordion, AccordionSummary, AccordionDetails, Checkbox, Select, MenuItem } from '@mui/material';
import { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import InputSlider from './InputSlider';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function Controls(props) {

  const darkTheme = createTheme({
    palette: {
      mode: 'light',
    },
  });

  function setValue(object, setFunction, att, value){
    setFunction({
      ...object,
      [att]: value
    });
  }
  

  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newTabIndex) => {
    setTabIndex(newTabIndex);
  };
  
  return (
    <ThemeProvider theme={darkTheme}>
        <Box className='controlsDiv'>
          <Box>
            <Tabs value={tabIndex} onChange={handleTabChange}>
              <Tab label="Cup" />
              <Tab label="Curves" />
              <Tab label="Tool" />
            </Tabs>
          </Box>
          <Box sx={{ padding: 2 }}>
            {tabIndex === 0 && (
              <Box>
                <Typography>Height</Typography>
                <InputSlider value={props.cupParams.height} setValue={(value) => setValue(props.cupParams, props.setCupParams, "height", value)} max={300} min={0.1}/>
                
                <Typography>Radius</Typography>
                <InputSlider value={props.cupParams.radius} setValue={(value) => setValue(props.cupParams, props.setCupParams, "radius", value)} max={100} min={0.1} />
                
                <Typography>Wall thickness</Typography>
                <InputSlider value={props.cupParams.wallThickness} setValue={(value) => setValue(props.cupParams, props.setCupParams, "wallThickness", value)} max={20} min={0.1}/>
              </Box>
            )}
            {tabIndex === 1 && (
              <Box>
                <Accord name="First Curve" waveParams={props.wave1Params} setWaveParams={props.setWave1Params}/>
                <Accord name="Second Curve" waveParams={props.wave2Params} setWaveParams={props.setWave2Params}/>
                <p> </p>
                <Typography>Smoothing (%)</Typography>
                <InputSlider value={props.waveSmoothing} setValue={props.setWaveSmoothing} max={100} min={0}/>
              </Box>

            )}
            {tabIndex === 2 && (
              <Box>
                <Typography>The third tab</Typography>
                <InputSlider />
              </Box>
            )}
          </Box>
        </Box>
    </ThemeProvider>
    
  );

}

const label = { inputProps: { 'aria-label': 'Checkbox demo' } };

function Accord(props) {

  function setValue(object, setFunction, att, value){
    setFunction({
      ...object,
      [att]: value
    });
  }

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel3-content"
        id="panel3-header"
      >
      {props.name}
      </AccordionSummary>
      <AccordionDetails>
        <Box>
          <Typography>Height</Typography>
          <InputSlider value={props.waveParams.height} setValue={(value) => setValue(props.waveParams, props.setWaveParams, "height", value)} max={50} min={0.1}/>
          
          <Typography>Width</Typography>
          <InputSlider value={props.waveParams.width} setValue={(value) => setValue(props.waveParams, props.setWaveParams, "width", value)} max={50} min={0.1}/>
          
          <Typography>Sharpness (%)</Typography>
          <InputSlider value={props.waveParams.sharpness} setValue={(value) => setValue(props.waveParams, props.setWaveParams, "sharpness", value)} max={100} min={0}/>
          
          <Select
            labelId="select-curveShape-label"
            id="select-curveShape"
            value={1}
            label="CurveShape"
            onChange={1}
          >
            <MenuItem value={0}>Triangle</MenuItem>
            <MenuItem value={1}>Elipsoid</MenuItem>
            <MenuItem value={2}>Sinus</MenuItem>
          </Select>

          <Typography>Invert Curve</Typography>
          <Checkbox {...label} checked={props.waveParams.outwards} onClick={() => setValue(props.waveParams, props.setWaveParams, "outwards", !props.waveParams.outwards)} />
        </Box>
      </AccordionDetails>
    </Accordion>

  );
}

export default Controls
