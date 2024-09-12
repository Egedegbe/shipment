const express = require('express');
const Shipment = require('../model/shipment');
const router = express.Router();

// Render pages
router.get('/', (req, res) => res.render('index'));
router.get('/about', (req, res) => res.render('about'));
router.get('/track', (req, res) => res.render('track'));
router.get('/contact', (req, res) => res.render('contact'));
router.get('/search_page', (req, res) => res.render('searchPage.ejs'));
router.get('/logintosite', (req, res) => res.render('login.ejs'));

// Search route
router.post('/search', async (req, res) => {
    const { search } = req.body;

    // Check if search input is provided
    if (!search) {
        req.flash("error_msg", "Tracking ID is required.");
        return res.redirect('back');
    }

    try {
        // Search for the shipment by tracking number
        const shipment = await Shipment.findOne({ trackingNumber: search });

        if (!shipment) {
            req.flash("error_msg", "Shipment not found");
            return res.redirect('back');
        }

        // Get and sort the history array by `currentDate` in descending order
        const historyArray = Array.isArray(shipment.history) ? shipment.history : [];
        historyArray.sort((a, b) => new Date(b.currentDate) - new Date(a.currentDate));

        // Get the latest history entry
        const latestHistoryEntry = historyArray[0];
        const latestStatus = latestHistoryEntry ? latestHistoryEntry.status : 'No status available';

        res.render('searchPage', { packageDetails: shipment, latestStatus });
    } catch (error) {
        console.error('Error searching for shipment:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
