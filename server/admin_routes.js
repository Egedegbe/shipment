const express = require('express')
const User = require('../model/user')
const shipment = require('../model/shipment')
// import { customAlphabet } = require('nanoid');
const router = express.Router()

router.get('/admin_dashboard', async (req,res)=>{
    try {
        const firstShipment = await shipment.findOne().sort({ createdAt: -1 });
        const totalShipment = await shipment.countDocuments()

        res.render('admin_dashboard', {main_content:'admin_dashboard_home.ejs', firstShipment,totalShipment})
    } catch (error) {
        console.log(error)
    }
    
})

router.get('/add_package',(req,res)=>{
    res.render('admin_dashboard',{main_content:'add_package'})
})

router.post('/addPackage', async(req,res)=>{
 const {senderName,senderEmail,senderAddress,senderCountry,recipientName,recipientEmail,recipientPhoneNumber,recipientAddress,recipientCity,recipientCountry,packageName,packageDescription,weight, packageValue, shippingMethod, shipmentDate, expectedDeliveryDate, history} = req.body;


 try {
    let newImageName;
    if (!req.files || Object.keys(req.files).length === 0) {
      console.log("no file uploaded");
    } else {
      const imageUploadFile = req.files.packageImage;
      newImageName = Date.now() + imageUploadFile.name;
      const uploadPath =
        require("path").resolve("./") + "/public/uploads/" + newImageName;

      imageUploadFile.mv(uploadPath, function (err) {
        if (err) {
          console.log(err);
        }
      });
    } 
    const insurance = req.body.insurance === 'true';
    const { customAlphabet } = await import('nanoid'); // Correct dynamic import

    // Define the custom alphabet and length
    // const nanoid = customAlphabet('1234567890abcdef', 6);
  
    // Generate a unique tracking ID with a '#' prefix
    // const trackingId = `#${nanoid()}`;
    
    const nanoid = customAlphabet('1234567890abcdef', 6);
    const trackingId = `#${nanoid()}`

    const newShipment = new shipment({
        trackingNumber:trackingId,
        senderName:senderName,
        senderEmail:senderEmail,
        senderAddress:senderAddress,
        senderCountry:senderCountry,
        recipientName:recipientName,
        recipientEmail:recipientEmail,
        recipientPhoneNumber:recipientPhoneNumber,
        recipientAddress:recipientAddress,
        recipientCity:recipientCity,
        recipientCountry:recipientCountry,
        packageName:packageName,
        packageDescription:packageDescription,
        weight:weight,
        packageValue:packageValue,
        shippingMethod:shippingMethod,
        shipmentDate:shipmentDate,
        expectedDeliveryDate:expectedDeliveryDate,
        insurance: insurance, // Handle checkbox
        packageImage:newImageName,
        history: [
            {
              status: req.body['history[0][Status]'],
              date: req.body['history[0][date]'],
              notes: req.body['history[0][notes]'],
              location: req.body['history[0][location]'],
            },
        ]
    })
    newShipment.save().then((result)=>{
        console.log('done')
    }).catch(err => console.log(err))
   
 } catch (error) {
    console.log(error)
 }
})

router.get('/all_packages', async(req,res)=>{
    try {
        const allPackages =  await shipment.find().exec()
        res.render('admin_dashboard',{main_content:'all_packages', allPackages})
    } catch (error) {
        console.log(error)
    }
})
router.get('/onePackage/:id',async (req,res)=>{
  try {
    const id = req.params.id
    const packageDetails = await shipment.findById(id)


    res.render('admin_dashboard',{main_content:'package_content',packageDetails,})
  } catch (error) {
    console.log(error)
  }
 
})

router.get('/editPackage/:id', async(req,res)=>{
  const id = req.params.id
  try {
    const toBeEditedShipment = await shipment.findById(id)
  res.render('admin_dashboard',{main_content:'package_edit', toBeEditedShipment})
  } catch (error) {
    console.log(error)
  }

})





router.put('/addPackage/:id', async (req, res) => {
  const id = req.params.id;
  let newImageName;

  // Handle file upload
  if (req.files && req.files.packageImage) {
      const imageUploadFile = req.files.packageImage;
      newImageName = Date.now() + path.basename(imageUploadFile.name);
      const uploadPath = path.resolve("./") + "/public/uploads/" + newImageName;

      try {
          await imageUploadFile.mv(uploadPath);
      } catch (err) {
          console.log("Error uploading file:", err);
          return res.status(500).send('Error uploading file');
      }
  }

  // Prepare updates
  const updates = {
      senderName: req.body.senderName,
      senderEmail: req.body.senderEmail,
      senderAddress: req.body.senderAddress,
      senderCountry: req.body.senderCountry,
      recipientName: req.body.recipientName,
      recipientEmail: req.body.recipientEmail,
      recipientPhoneNumber: req.body.recipientPhoneNumber,
      recipientAddress: req.body.recipientAddress,
      recipientCity: req.body.recipientCity,
      recipientCountry: req.body.recipientCountry,
      packageName: req.body.packageName,
      packageDescription: req.body.packageDescription,
      weight: req.body.weight,
      packageValue: req.body.packageValue,
      shippingMethod: req.body.shippingMethod,
      shipmentDate: new Date(req.body.shipmentDate),
      expectedDeliveryDate: new Date(req.body.expectedDeliveryDate),
      insurance: req.body.insurance ? true : false, // Checkbox handling
      packageImage: newImageName || req.body.packageImage // Handle image upload
  };

  // Handle history updates
  if (req.body['newHistory[Status]']) {
      const newHistoryEntry = {
          status: req.body['newHistory[Status]'],
          date: new Date(req.body['newHistory[date]']),
          location: req.body['newHistory[location]'],
          notes: req.body['newHistory[notes]']
      };

      console.log("New History Entry Created:", newHistoryEntry);

      // Use the $push operator to add the new history entry
      updates.$push = { history: newHistoryEntry };
  }

  try {
      const Shipment = await shipment.findByIdAndUpdate(id, updates, { new: true });

      if (!Shipment) {
          return res.status(404).send('Shipment not found');
      }

      console.log("Shipment updated successfully");
      req.flash("success_msg", "Package Updated Successfully");
      res.redirect('/admin/admin_dashboard'); // Redirect to the dashboard or another page
  } catch (error) {
      console.log("Error updating shipment:", error);
      res.status(500).send('Server error');
  }
});



module.exports = router;





module.exports = router